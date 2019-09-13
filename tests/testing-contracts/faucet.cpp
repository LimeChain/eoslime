#include <eosio/eosio.hpp>
#include <eosio/symbol.hpp>
#include "eosio.token.cpp"

using namespace eosio;

CONTRACT faucet : public contract
{

public:
	using contract::contract;

	faucet(name receiver, name code, datastream<const char *> ds) : contract(receiver, code, ds),
																	withdrawersTable(receiver, code.value)
	{
	}

	TABLE withdrawer
	{
		uint64_t account;
		asset quantity;
		std::string token_name;
		std::string memo;

		uint64_t primary_key() const { return account; }
		uint64_t balance_key() const { return quantity.amount; }
	};
	typedef eosio::multi_index<"withdrawers"_n, withdrawer, eosio::indexed_by<"bybalance"_n, eosio::const_mem_fun<withdrawer, uint64_t, &withdrawer::balance_key>>> withdrawers;
	withdrawers withdrawersTable;

	ACTION produce(name to, asset quantity, std::string token_name, std::string memo)
	{

		withdrawersTable.emplace(_self, [&](auto &s) {
			s.account = to.value;
			s.quantity = quantity;
			s.token_name = token_name;
			s.memo = memo;
		});
	}

	ACTION withdraw(name withdrawer)
	{
		// Inline action (Call token contract)
		for (auto &currentWithdrawer : withdrawersTable)
		{
			if (currentWithdrawer.account == withdrawer.value)
			{
				token::issue_action issue(currentWithdrawer.token_name, {get_self(), "active"_n});
				issue.send(withdrawer, currentWithdrawer.quantity, currentWithdrawer.memo);
			}
		}
	}
};