package it.polimi.tiwria.ClassesForJSON;

import it.polimi.tiwria.Bean.Product;
import it.polimi.tiwria.Bean.Supplier;
import it.polimi.tiwria.DAO.ProductDAO;
import it.polimi.tiwria.Utilities.Pair;

import java.util.List;
import java.util.Map;

public class ProductWithFullInfo {

    private Product product;

    private List<SupplierWithPrice> suppliersWithPrice;

    public ProductWithFullInfo(Product product, List<SupplierWithPrice> suppliersWithPrice) {
        this.product = product;
        this.suppliersWithPrice = suppliersWithPrice;
    }

    public ProductWithFullInfo(Product product, Map<Supplier, Pair<Integer,Double>> supplierPricerMap) {
        this.product = product;



        this.suppliersWithPrice = supplierPricerMap.entrySet().stream().map(
                x -> new SupplierWithPrice(x.getKey(),x.getValue().getFirst(),x.getValue().getSecond())
        ).toList();
    }


}
